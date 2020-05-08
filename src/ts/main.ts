import 'simple-steering-wheel';
import { AreaSelector } from 'simple-steering-wheel';
import { Props, sendRequestSubsequently } from './connection.service';

const maxAngle = 180;
function initServos() {
  const areas = [].slice.apply(document.querySelectorAll('area-selector')) as AreaSelector[];
  areas.forEach((a, i) => a.addEventListener('changed', () => listenForChange(a, i)));
}

function listenForChange(area: AreaSelector, index: number) {
  const y = area.pointFromZeroPercents().y;
  const propName = Props[Object.keys(Props)[index]];
  const effectiveY = index === 2 ? y : 1 - y;
  sendRequestSubsequently({ [propName]: Math.round(maxAngle * effectiveY) });
}
initServos();
