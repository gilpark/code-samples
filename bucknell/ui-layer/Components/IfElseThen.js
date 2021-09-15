import React, { useState } from "react"
export const IfElseThen = (condition, TrueComp, FalseComp ) => {
    function HOC(props) {
        return (
            <>
                { condition? <TrueComp {...props}/> : <FalseComp {...props}/> }
            </>
        )
    }
    return HOC
}
