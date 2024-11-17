const elementProperties = {
    contentWidth: "",    
    paddingLeft: "",
    paddingRight: "",
    paddingTop: "",
    paddingBottom: "",
    marginTop: "",
    marginBottom: "",
    marginLeft: "", 
    marginRight: ""
} as const

type ElementProperies = typeof elementProperties;

function calculatePercentage(part: number, total: number) : number {
    return (part / total) * 100
}

chrome.devtools.panels.elements.createSidebarPane("Percentage", (sidebar) => {
    // sidebar.setPage('sidebar.html')

    chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
        chrome.devtools.inspectedWindow.eval(`
            (() => {
                const element = $0; // Get the selected element
                if (!element) return null;
                const computedStyle = window.getComputedStyle(element);                
                return {
                    paddingLeft: computedStyle.paddingLeft,
                    paddingRight: computedStyle.paddingRight,
                    paddingTop: computedStyle.paddingTop,
                    paddingBottom: computedStyle.paddingBottom,
                    marginTop: computedStyle.marginTop,
                    marginBottom: computedStyle.marginBottom,
                    marginLeft: computedStyle.marginLeft,
                    marginRight: computedStyle.marginRight,
                    contentWidth: computedStyle.width,                               
                };
            })();
          `,
          (result, isException) => {
            if (isException) {
                sidebar.setObject(isException, "Error");                
            } else {
                const elementProperies = result as ElementProperies
                const contentWidth = parseFloat(elementProperies.contentWidth)                

                const calculateObject = {}
                
                Object.keys(elementProperties).filter(key => {
                    return (key !== "contentWidth" && key !== "parentHeight");
                }).map((key) => {                    
                    calculateObject[key] = calculatePercentage(parseFloat(elementProperies[key]), contentWidth)                    
                })
                
                sidebar.setObject(calculateObject, "Percentage")
                                
            }
          }
        )
    })
})

