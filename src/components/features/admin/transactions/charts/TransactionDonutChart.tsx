'use client'

import { permanentRedirect } from "next/navigation"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TransactionWithProfile } from '@/lib/types';

const COLORS = {
    PEMASUKAN: '#22c55e', 
  PENGELUARAN: '#ef4444',
}

export default function TransactionDonutChart({ transactions }: {transactions: TransactionWithProfile[]}) {
    const totals = transactions.reduce((accumulation, transaction) => {
      if (transaction.type === 'PEMASUKAN') {
          accumulation.pemasukan += transaction.amount
      } else {
        accumulation.pengeluaran += Math.abs(transaction.amount)
      }
      return accumulation;
    }, { pemasukan: 0, pengeluaran: 0 })

    const chartData = [
      { name: 'Pemasukan', value: totals.pemasukan },
      { name: 'Pengeluaran', value: totals.pengeluaran }
    ]
    
    return (
      <div className="p-4 border rounded-lg bg-gray-50 h-[350px]">
        <h3 className="font-semibold mb-4">Komposisi Keuangan</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
            data={chartData}
            cy={"50%"}
            cx={"50%"}
            innerRadius={40}
            outerRadius={80}
            fill="8884d8"
            paddingAngle={5}
            dataKey={"value"}
            nameKey={"name"}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name === 'Pemasukan' ? "PEMASUKAN" : 'PENGELUARAN']}></Cell>
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
}