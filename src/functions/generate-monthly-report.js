import { createClient } from "npm:@insforge/sdk@latest";

module.exports = async function(request) {
  try {
    const { userId, month, year } = await request.json();
    
    if (!userId || !month || !year) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize client with admin privileges to aggregate all data
    const insforge = createClient({
      baseUrl: Deno.env.get("INSFORGE_URL"),
      apiKey: Deno.env.get("INSFORGE_ADMIN_KEY")
    });

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // 1. Fetch transactions
    const { data: transactions, error: txError } = await insforge.database
      .from('transactions')
      .select('type, amount, categories(name)')
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (txError) throw txError;

    // 2. Aggregate data
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};

    (transactions || []).forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        const catName = tx.categories?.name || 'Lainnya';
        categoryMap[catName] = (categoryMap[catName] || 0) + amount;
      }
    });

    const topCategories = Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 3. Upsert report
    const { data: report, error: reportError } = await insforge.database
      .from('monthly_reports')
      .upsert([{
        user_id: userId,
        month_year: startDate,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_cashflow: totalIncome - totalExpense,
        top_categories: topCategories,
        transaction_count: transactions.length,
        generated_at: new Date().toISOString()
      }], { onConflict: 'user_id, month_year' });

    if (reportError) throw reportError;

    return new Response(JSON.stringify({ status: 'ok', data: report }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
