import { createClient } from 'npm:@insforge/sdk';

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { month, year } = body;
    
    console.log(`Generating report. Month: ${month}, Year: ${year}`);
    
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!userToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Explicitly set baseUrl to match the project in .env.local
    const baseUrl = 'https://mrdw83b9.ap-southeast.insforge.app';

    const insforge = createClient({
      baseUrl: baseUrl,
      edgeFunctionToken: userToken
    });

    const { data: userData, error: authError } = await insforge.auth.getCurrentUser();
    if (authError || !userData?.user?.id) {
       return new Response(JSON.stringify({ error: `Auth failed: ${authError?.message || 'No user'}` }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = userData.user.id;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    // End of month
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // 1. Fetch transactions
    const { data: transactions, error: txError } = await insforge.database
      .from('transactions')
      .select('type, amount, category_id')
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (txError) throw new Error(`TX Fetch Error: ${txError.message}`);

    // 2. Fetch categories
    const { data: categories, error: catError } = await insforge.database
      .from('categories')
      .select('id, name');

    if (catError) throw new Error(`Category Fetch Error: ${catError.message}`);

    const catMap = {};
    categories.forEach(c => catMap[c.id] = c.name);

    // 3. Aggregate
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryAgg = {};

    (transactions || []).forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        const catName = catMap[tx.category_id] || 'Lainnya';
        categoryAgg[catName] = (categoryAgg[catName] || 0) + amount;
      }
    });

    const topCategories = Object.entries(categoryAgg)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 4. Upsert report
    const { data: report, error: reportError } = await insforge.database
      .from('monthly_reports')
      .upsert([{
        user_id: userId,
        month_year: startDate,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_cashflow: totalIncome - totalExpense,
        top_categories: topCategories,
        transaction_count: (transactions || []).length,
        generated_at: new Date().toISOString()
      }], { onConflict: 'user_id,month_year' });

    if (reportError) throw new Error(`Report Upsert Error: ${reportError.message}`);

    return new Response(JSON.stringify({ status: 'ok', data: report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
