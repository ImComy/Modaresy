import React, { createContext, useContext } from "react";


export const StepDataContext = createContext(null);


export function useStepData() {
return useContext(StepDataContext);
}