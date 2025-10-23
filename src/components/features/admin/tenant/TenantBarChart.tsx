'use client'

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { createBrowserClient } from "@supabase/ssr"

import { TransactionWithProfile } from "@/lib/types"

export default function TenantBarChart() {
    const [transactions, setTransactions] = useState<TransactionWithProfile[]>([])
    const [loading, setLoading] = useState(false)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const fetchDataAndProcess = async () => {
            setLoading(true)

            const [transactionRes, profilesRes] = await Promise.all([
                supabase.from('transactions').select('*'),
                supabase.from('profiles').select('tenant_name')
            ])

            if (transactionRes.error) {
                console.error('Error fecthing data:', transactionRes.error)
                setLoading(false)
                return
            }

            const transactions: TransactionWithProfile[] = await transactionRes.data
            console.log("nilai transactions:",transactions)
            setTransactions(transactions)
        }

        fetchDataAndProcess()
    }, [])

    return(
        <div></div>
    )
}