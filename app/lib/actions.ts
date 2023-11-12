'use server'

import { signIn } from "@/auth";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod"
// import { DELETED_INVOICE, INVALID_FORM_DATA } from "./statuses";

const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer' // message if user didn't choose a customer 
    }),
    amount: z.coerce
        .number() // will be changed to number
        .gt(0, 'Please select a amount greater than $0.'), // empty string will become a zero and we're checking that the amount is more than 0
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string(),
})

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(_: State, formData: FormData) {
    const parseRes = CreateInvoice.safeParse({
        customerId: formData.get("customerId"),
        amount: formData.get("amount"),
        status: formData.get("status"),
    });

    if (!parseRes.success) {
        return {
            errors: parseRes.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to validate invoice inputs'
        }
    }
    const { customerId, amount, status } = parseRes.data;

    const amountCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountCents}, ${status}, ${date})
        `
    } catch (_) {
        return {
            message: 'Database Error: Failed to Create Invoice.'
        }
    }

    revalidatePath('dashboard/invoices')
    redirect('/dashboard/invoices')
}

const UpdateInvoice = InvoiceSchema.omit({
    date: true
})

export async function updateInvoice(id: string, _: State, formData: FormData) {
    const parseRes = UpdateInvoice.safeParse({
        id: id,
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    if (!parseRes.success) {
        return {
            errors: parseRes.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to validate invoice inputs'
        }
    }

    const { customerId, amount, status } = parseRes.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `
    } catch (_) {
        return {
            message: 'Database Error: Failed to Create Invoice.'
        }
    }

    revalidatePath('dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
    try {
        await sql`
            DELETE FROM invoices WHERE id = ${id}
        `

        revalidatePath('dashboard/invoices')

        return {
            message: 'Deleted invoice'
        }
    } catch (_) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}

export async function authenticate(
    _: string | undefined,
    formData: FormData
) {
    try {
        // try to sign in
        await signIn('credentials', Object.fromEntries(formData))
    } catch (err) {
        // If there's a 'CredentialSignin' error, you want to return it so that you can show an appropriate error message.
        if ((err as Error).message.includes('CredentialsSignin')) {
            return 'CredentialSignin'
        }
        throw err
    }
}