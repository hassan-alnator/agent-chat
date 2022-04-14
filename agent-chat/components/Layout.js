import Head from 'next/head'
import Link from 'next/link'


export default function Layout({children}) {
    return (
        <div>
            <Head>
                <title>Customer Service</title>
                <link rel="stylesheet" href="https://unpkg.com/@progress/kendo-theme-material@latest/dist/all.css"></link>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
                <style>{`
                    .k-chat {
                        border-radius: 15px;
                        max-width: 100%!important
                    }
                `}
                </style>
            </Head>
            <div>{children}</div>
        </div>
    )
}