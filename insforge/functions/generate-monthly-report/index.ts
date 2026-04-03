import { createClient } from 'npm:@insforge/sdk@latest';

export default async function(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get('INSFORGE_SERVICE_KEY');

    if (!serviceKey) {
      return new Response(JSON.stringify({ error: 'INSFORGE_SERVICE_KEY not configured' }), { headers, status: 500 });
    }

    if (authHeader !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers, status: 401 });
    }

    const { userId, month, year } = await req.json();
    if (!userId || !month || !year) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { headers, status: 400 });
    }

    const baseUrl = 'https://mrdw83b9.ap-southeast.insforge.app';
    const insforge = createClient({
      baseUrl,
      anonKey: serviceKey,
      isServerMode: true
    });

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data: transactions, error: txError } = await insforge.database
      .from('transactions')
      .select('*, categories(name, type)')
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (txError) throw txError;

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions?.forEach((tx: any) => {
      const amount = Number(tx.amount);
      const type = tx.categories?.type;
      const catName = tx.categories?.name || 'Uncategorized';

      if (type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        categoryTotals[catName] = (categoryTotals[catName] || 0) + amount;
      }
    });

    // Format top_categories as an array of objects for the UI
    const totalExpVal = totalExpense || 1; // avoid div by zero
    const top_categories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]) // highest first
      .slice(0, 5) // top 5
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalExpVal) * 100
      }));

    const net_cashflow = totalIncome - totalExpense;

    const { data: upsertData, error: upsertError } = await insforge.database
      .from('monthly_reports')
      .upsert({
        user_id: userId,
        month_year: startDate,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_cashflow: net_cashflow,
        top_categories: top_categories,
        transaction_count: transactions?.length || 0,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, month_year' });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ 
      success: true, 
      data: { totalIncome, totalExpense, net_cashflow, count: transactions?.length || 0 } 
    }), { headers, status: 200 });

  } catch (error: any) {
    console.error('Report Generation Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { headers, status: 500 });
  }
}
