import * as echarts from "echarts/core"
import { LineChart } from "echarts/charts"
import { GraphicComponent, GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"

echarts.use([LineChart, GraphicComponent, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer])

export default echarts
