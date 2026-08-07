import * as echarts from "echarts/core"
import { LineChart } from "echarts/charts"
import { GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"

echarts.use([LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer])

export default echarts
