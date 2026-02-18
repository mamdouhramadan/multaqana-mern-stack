import { useEffect } from "react";
import PageLayout from "@/layout/PageLayout";
import HeroBanner from "@/components/home/HeroBanner";
import { HomeCtaOrgChart } from "@/components/home/HomeCtaOrgChart";
import { NewsListSwiper } from "@/components/home/NewsListSwiper";
import { HomeEmployeesSwiper } from "@/components/home/HomeEmployeesSwiper";
import { HomeFilesList } from "@/components/home/HomeFilesList";
import { HomeEventsSwiper } from "@/components/home/HomeEventsSwiper";
import { HomeMagazineSwiper } from "@/components/home/HomeMagazineSwiper";
import { HomeAlbumsSection } from "@/components/home/HomeAlbumsSection";
import { HomeCtaContact } from "@/components/home/HomeCtaContact";
import { HomeExploreSection } from "@/components/home/HomeExploreSection";

const Home = () => {
  useEffect(() => {
    document.body.classList.add("transparent");
    return () => {
      document.body.classList.remove("transparent");
    };
  }, []);
  return (
    <PageLayout isFullPage={true} hasPageTitle={false} hasBreadcrumb={false}>
      <HeroBanner />
      <div className="w-full  py-10 md:py-20">
        <HomeCtaOrgChart />
        <NewsListSwiper />
        <HomeEmployeesSwiper />
        <HomeFilesList />
        <HomeEventsSwiper />
        <HomeMagazineSwiper />
        <HomeAlbumsSection />
        <HomeCtaContact />
        <HomeExploreSection />
      </div>
    </PageLayout>
  );
};

export default Home;
