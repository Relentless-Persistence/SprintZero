import Head from "next/head";
import Layout from "../../components/Dashboard/Layout";
import { useState } from "react";
import UserStory from "../../components/UserStory";

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

      <Layout
        // breadCrumbItems={ [ "StoryMap" ] }
        // hasSideAdd={ false }
        // hasMainAdd={ false }
        // rightNavItems={ versions }
        // activeRightItem={ version }
        // setActiveRightNav={ handleActiveVersion }
      >
        <UserStory />
      </Layout>
    </div>
  );
}
