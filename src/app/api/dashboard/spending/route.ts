import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month start
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    // Fetch spending by category (current month)
    const { data: categoryData, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .eq('type', 'debit')
      .gte('created_at', currentMonthStart);

    if (error) {
      console.error('Error fetching spending:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate by category
    const categoryMap: { [key: string]: number } = {};
    const categoryColors: { [key: string]: string } = {
      food_dining: '#0088FE',
      transportation: '#00C49F',
      shopping: '#FFBB28',
      bills_utilities: '#FF8042',
      entertainment: '#8884d8',
      healthcare: '#FF6B9D',
      education: '#AA66CC',
      other: '#999999',
    };

    (categoryData || []).forEach(
      (txn: { category: string; amount: number }) => {
        const cat = txn.category || 'other';
        categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(txn.amount);
      }
    );

    const spending = Object.entries(categoryMap).map(([key, value]) => ({
      name: key
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      value: Math.round(value),
      color: categoryColors[key] || '#999999',
    }));

    console.log('API: Fetched spending data:', spending);

    return NextResponse.json({ spending });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
