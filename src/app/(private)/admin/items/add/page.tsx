import { Button } from '@/components/ui/button'
import PageTitle from '@/components/ui/page-title'
import { Link } from 'lucide-react'
import React from 'react'
import ItemForm from '../_components/item-form'

function AddItemPage() {
  return (
    <div className='flex flex-col justify-between gap-5'>
        <PageTitle title='Add Items' />
        <ItemForm 
          formType='add'
        />
    </div>
  )
}

export default AddItemPage