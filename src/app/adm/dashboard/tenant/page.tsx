'use client'

import  TenantsTable  from "@/components/features/admin/tenant/TenantsTable"
import TenantBarChart from "@/components/features/admin/tenant/TenantBarChart"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import  AddEditTransactionModal from  "@/components/features/admin/transactions/AddEditTransactionModal"

import { useEffect, useState } from "react"

import { TransactionWithProfile, ProfileForFilter } from "@/lib/types"

export default function AdminDashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [edittingTansaction, setEditingTransaction] = useState<TransactionWithProfile | null>(null)
    const [profiles, setProfiles] = useState<ProfileForFilter[]>([])

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('id, tenant_name')
        setProfiles(data || [])
    }
    
    useEffect(() => {
        fetchProfiles()
    }, [])

    const handleOpenAddModal = () => {
        setEditingTransaction(null)
        setIsModalOpen(true)
        
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const handleSuccess = () => {
        handleCloseModal()
    }

    return (
        <main className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Tenant</h1>
          <p className="text-gray-500">Lihat dan Analisis semua informasi mengenai Tenant disini.</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>
            <TenantsTable></TenantsTable>
        
        <div className="italic">
            <h4 className="font-semibold">*note</h4>
            <ul className="text-sm">
                <li>Chart Batang untuk Tenant berdasarkan saldo bersih</li>
                <li>Chart batang untuk kategori berdasarkan saldo bersih</li>
            </ul>
        </div>

            <AddEditTransactionModal
            isOpen = {isModalOpen}
            onClose = {handleCloseModal}
            onSuccess={handleSuccess}
            transactionToEdit={edittingTansaction}
            allTenants={profiles}
            ></AddEditTransactionModal>
            <TenantBarChart></TenantBarChart>
        </main>
    )
}