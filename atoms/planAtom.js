import { atom, selector } from "recoil"

export const planState = atom({
  key: "planState",
  default: null,
})

export const selectedPlanState = selector({
  key: "selectedPlanState",
  get: ({ get }) => {
    const plan = get(planState);
    let selectedPlan;
    if (plan === "basic") {
      selectedPlan = "Basic";
    } else if (plan === "professional") {
      selectedPlan = "Professional";
    } else {
      selectedPlan = null;
    }
    return selectedPlan;
  },
});