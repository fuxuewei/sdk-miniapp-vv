import WebTracer from './platforms/web';
import WxTracer from './platforms/wx';
import UnknownTracer from './platforms/unknown';
import { trackAllType } from './type';
import ExposureContainer, { ExposureContainerProps } from './components/Exposure';
import ExposureItem, { ExposureItemProps } from './components/Exposure/item';
declare const TezignTracer: typeof WebTracer | typeof WxTracer | typeof UnknownTracer;
export default TezignTracer;
export { ExposureContainer, ExposureItem };
export type { ExposureContainerProps, ExposureItemProps, trackAllType };