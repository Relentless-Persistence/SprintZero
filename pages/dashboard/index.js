import Head from "next/head";
import AppLayout from "../../components/Dashboard/AppLayout";
import { useState } from "react";

const versions = [ "v1", "v2", "v3" ];

export default function Home ()
{
  const [ version, setVersion ] = useState( versions[ 0 ] );


  const handleActiveVersion = ( version ) =>
  {

    const versionIndex = versions.findIndex( v => v === version );


    if ( versionIndex > -1 )
    {
      setVersion( versions[ versionIndex ] );
    }


  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        breadCrumbItems={ [ "StoryMap" ] }
        hasSideAdd={ false }
        hasMainAdd={ false }
        rightNavItems={ versions }
        activeRightItem={ version }
        setActiveRightNav={ handleActiveVersion }
      >
        <p>Node chart will go here</p>
      </AppLayout>
    </div>
  );
}
