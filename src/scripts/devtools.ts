const elementProperties = {
    contentWidth: "",    
    contentHeight: "",
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

function gcd(a, b){
    return b ? gcd(b, a % b) : a;
}

function calculateAspectRatio(width, height) {
    const divisor = gcd(width, height);            
    return `${width / divisor}:${height / divisor}`;
}


chrome.devtools.panels.elements.createSidebarPane("Extended", (sidebar) => {
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
                    contentHeight: computedStyle.height                 
                };
            })();
          `,
          (result, isException) => {
            if (isException) {
                sidebar.setObject(isException, "Error");                
            } else {                
                const elementProperies = result as ElementProperies
                const contentWidth = parseFloat(elementProperies.contentWidth)    
                const contentHeight = parseFloat(elementProperies.contentHeight)                

                const calculateObject = {}
                
                Object.keys(elementProperties).filter(key => {
                    return (key !== "contentWidth" && key !== "contentHeight");
                }).map((key) => {                    
                    if (parseFloat(elementProperies[key])) {
                        calculateObject[key] = `${calculatePercentage(parseFloat(elementProperies[key]), contentWidth)}%`
                    } else {
                        calculateObject[key] = "0%"
                    }
                })

                
                calculateObject['padding'] = `${calculateObject["paddingTop"]} ${calculateObject["paddingRight"]} ${calculateObject["paddingBottom"]} ${calculateObject["paddingLeft"]}`;
                calculateObject['margin'] = `${calculateObject["marginTop"]} ${calculateObject["marginRight"]} ${calculateObject["marginBottom"]} ${calculateObject["marginLeft"]}`;
                calculateObject['aspect-ratio'] = calculateAspectRatio(contentWidth, contentHeight)
                
                sidebar.setObject(calculateObject, "Extended") 
            }
          }
        )
    })
})

