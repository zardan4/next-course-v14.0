import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Params = {
    params: {
        id: string
    }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    return {
        title: `Invoice ${params.id}`,
    }
}

export default async function Page({
    params
}: {
    params: {
        id: string
    }
}) {
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(params.id),
        fetchCustomers()
    ])

    // return a 404 error
    if (!invoice) {
        notFound()
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${params.id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}