import React, { useState } from "react";
import { Map, Marker } from "pigeon-maps";

import "./EarthMap.css";

const EarthMap = ({ location }) => {
  const [hue, setHue] = useState(0);
  const color = `hsl(${hue % 360}deg 39% 70%)`;

  return (
    <Map
      height={312}
      defaultCenter={[location.lat, location.lng]}
      defaultZoom={16}
      twoFingerDrag={true}>
      <Marker
        width={50}
        anchor={[location.lat, location.lng]}
        color={color}
        onClick={() => setHue(hue + 20)}
      />
    </Map>
  );
};

export default EarthMap;
