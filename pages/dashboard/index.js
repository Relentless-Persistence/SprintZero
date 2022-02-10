import Head from "next/head";
import DashboardLayout from "../../components/Dashboard/Layout";


export default function Home ()
{
  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DashboardLayout />
    </div>
  );
}
