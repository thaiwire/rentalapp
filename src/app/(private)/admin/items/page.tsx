'use client'
import { Button } from '@/components/ui/button'
import PageTitle from '@/components/ui/page-title'
import React from 'react'
import Link from 'next/link'

function AdminItemPage() {
  return (
    <div className='flex justify-between gap-5 items-center'>
        <PageTitle title='Items' />
        <Button> 
         <Link className='mr-2' href='/admin/items/add' >      
            Add Item
         </Link>
       </Button>
    </div>
  )
}

export default AdminItemPage