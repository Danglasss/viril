import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="fr">
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap" rel="stylesheet" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          {/* React UMD for legacy SPA bundle in /public/app.js */}
          <script crossOrigin="anonymous" src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossOrigin="anonymous" src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          {/* Hotjar */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6538850,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}} />
          {/* Google Tag Manager */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-T89MWKFV');
          `}} />
        </Head>
        <body>
          {/* Google Tag Manager (noscript) */}
          <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T89MWKFV" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;


