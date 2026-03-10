import BannerClient from "@/components/admin/BannerClient";
import { getAdminBannerConfig } from "@/services/admin-banner.service";

export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
    const bannerConfig = await getAdminBannerConfig();
    return <BannerClient initialBanner={bannerConfig} />;
}
