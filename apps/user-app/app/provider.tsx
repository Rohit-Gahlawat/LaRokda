"use client"
import { Provider } from "@repo/store";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return <Provider>
        {children}
    </Provider>

}