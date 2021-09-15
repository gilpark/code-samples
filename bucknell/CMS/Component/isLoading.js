import Loader from "react-loader-spinner"
import React, { useState } from "react"

export const LoadingIndicator = () => {
    return (
        <div
            style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: 'rgba(0,56,101,1)',
            }}
        >
            <Loader type="ThreeDots" color="white" height="100" width="100" />
        </div>
    )
}
export const IsLoadingHOC = Component => {
    function HOC(props) {
        const [isLoading, setLoading] = useState(true)
        const setLoadingState = isComponentLoading =>
            setLoading(isComponentLoading)
        return (
            <>
                {isLoading && <LoadingIndicator />}
                <Component {...props} setLoadingState={setLoadingState} />
            </>
        )
    }
    return HOC
}
