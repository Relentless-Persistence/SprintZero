import Head from 'next/head'
import Plans from '../components/Plans'
import Layout from '../components/Layout'


export default function Home() {
  return (
    <div className="mb-8">
      <Head>
        <title>Sprint Zero</title>
        <meta name="description" content="Generated by create-next-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Plans />
      </Layout>
    </div>
  );
}
