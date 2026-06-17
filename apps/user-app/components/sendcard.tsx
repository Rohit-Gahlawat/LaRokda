"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pMoney } from "@/app/actions"

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");

    return <div className="h-[90vh]">
        <Center>
            <Card title="Send">
                <div className="min-w-72 pt-2">
                    <TextInput placeholder={"Enter Mobile Number"} label="Send To" onChange={(value) => {
                        setNumber(value)
                    }} />
                    <TextInput placeholder={"Enter amount"} label="Amount" onChange={(value) => {
                        setAmount(value)
                    }} />
                    <div className="pt-4 flex justify-center">
                        <Button onClick={async () => {
                            try { await p2pMoney(number, Number(amount)) } catch (err) {
                                alert(err instanceof Error ? err.message : "something went wrong")

                            }

                        }}>Send</Button>
                    </div>
                </div>
            </Card>
        </Center>
    </div>
}