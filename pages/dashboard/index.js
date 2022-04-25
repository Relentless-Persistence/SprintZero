import Head from "next/head";
import { useRouter } from "next/router";
import AppLayout from "../../components/Dashboard/AppLayout";
import { useState } from "react";
import UserStory from "../../components/UserStory";
import { findIndex } from "lodash";
import { splitRoutes } from "../../utils";

const versions = ["v1", "v2", "v3", "All"];

export default function Home() {
  const { pathname } = useRouter();
  console.log(pathname);
  const [version, setVersion] = useState(versions[0]);

  const handleActiveVersion = (version) => {
    const versionIndex = versions.findIndex((v) => v === version);

    if (versionIndex > -1) {
      setVersion(versions[versionIndex]);
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
        ignoreLast={true}
        breadCrumbItems={[`Story Map / ${version}`]}
        hasSideAdd={false}
        hasMainAdd={true}
        rightNavItems={versions}
        activeRightItem={version}
        mainClass="mr-[100px]"
        sideBarClass={"min-w-[82px]"}
        addNewText="Add Version"
        setActiveRightNav={handleActiveVersion}
      >
        <UserStory />
      </AppLayout>
    </div>
  );
}
