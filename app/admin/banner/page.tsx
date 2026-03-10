import BannerClient from "@/components/admin/BannerClient";
import { getAdminBannerUrl } from "@/services/admin-banner.service";

export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
    const bannerUrl = await getAdminBannerUrl();
    return <BannerClient initialBannerUrl={bannerUrl} />;
}
