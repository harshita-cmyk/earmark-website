import SlicedWaves from './SlicedWaves';
import './EarmarkReveal.css';

const wavePalette = ['#3058BF', '#7545BD', '#B03989'];

export default function EarmarkReveal() {
  return (
    <div id="earmark-reveal" aria-hidden="true" className="earmark-reveal">
      <SlicedWaves
        className="earmark-reveal-waves"
        colors={wavePalette}
        accentColor="#11788A"
        ribbons={3}
        spacing={28}
        perspective={0.45}
        blur={0.6}
        glow={1}
        brightness={2.4}
        position={0.78}
        grain={0}
        mouseInteraction={true}
        lightMode
      />
    </div>
  );
}
