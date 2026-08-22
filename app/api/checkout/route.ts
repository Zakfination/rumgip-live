import {NextResponse} from 'next/server'
const PRICES={daily:29000,full:99000} as const
export async function POST(req:Request){const form=await req.formData();const plan=String(form.get('plan')||'daily') as keyof typeof PRICES;const email=String(form.get('email')||'');if(!email||!(plan in PRICES))return NextResponse.json({error:'Invalid checkout request'},{status:400});
// Production integration point: create an order server-side with Midtrans/Xendit.
// Never trust client price; use PRICES above and verify the gateway webhook before granting access.
if(!process.env.PAYMENT_SERVER_KEY)return NextResponse.json({error:'Payment gateway is not configured yet',code:'PAYMENT_NOT_CONFIGURED'},{status:503});
return NextResponse.json({message:'Payment adapter ready',amount:PRICES[plan],plan,email})
}
