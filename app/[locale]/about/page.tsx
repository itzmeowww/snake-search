'use client'

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";



const Page = () => {
    const t = useTranslations('About')
    const params = useParams();
    const { locale } = params
    return (
        <main className="max-w-2xl mx-auto py-12 flex flex-col gap-6">
            <div className=" w-fit flex gap-2 fixed top-4 right-6">
                <Link href={'/about'} locale="en">
                    <Button size={'sm'} variant={locale == 'en' ? 'default' : 'outline'}>EN</Button>
                </Link>
                <Link href={'/about'} locale="ja">
                    <Button size={'sm'} variant={locale == 'ja' ? 'default' : 'outline'}>JA</Button>
                </Link>
            </div>
            <Link href={`/`}><Button>{t('Back')}</Button></Link>

            <h1 className="text-2xl text-center">{t('Title')}</h1>
            <p>{t('Paragraph1')}</p>
            <p>{t('Paragraph2')}</p>
            <p>{t('Paragraph3')}</p>
            <p>{t('Paragraph4')}</p>
        </main>
    );
}

export default Page;