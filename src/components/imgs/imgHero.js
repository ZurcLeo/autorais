// ImgHero.js
import React from "react";
import Img from "./components/imgs/ZurcLeo_a_landscape_in_a_happy_classroom_with_technology_84edc3ef-4a13-429b-be69-14f32fb3c920.png"

const ImgHero = ({ className, style }) => (
    <img
        src={Img}
        alt="sala de aula divertida, iluminada"
        className={className}
        style={style}
    />
);

export default ImgHero;
