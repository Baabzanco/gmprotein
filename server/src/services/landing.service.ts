import { landingRepository } from "../repositories/landing.repository";
import { campaignRepository } from "../repositories/campaign.repository";

export class LandingService {
  async getFullLandingData() {
    const [faqs, customers, achievements, steps, activeCampaign, settings] = await Promise.all([
      landingRepository.getFaqs(),
      landingRepository.getCustomers(),
      landingRepository.getAchievements(),
      landingRepository.getCooperationSteps(),
      campaignRepository.getActive(),
      landingRepository.getPublicSettings(),
    ]);

    return {
      faqs,
      customers,
      achievements,
      cooperationSteps: steps,
      campaign: activeCampaign,
      settings,
    };
  }

  async getActiveCampaign() {
    return campaignRepository.getActive();
  }

  async getFaqs() {
    return landingRepository.getFaqs();
  }

  async getCustomers() {
    return landingRepository.getCustomers();
  }

  async getAchievements() {
    return landingRepository.getAchievements();
  }

  async getCooperationSteps() {
    return landingRepository.getCooperationSteps();
  }

  async getPublicSettings() {
    return landingRepository.getPublicSettings();
  }
}

export const landingService = new LandingService();
