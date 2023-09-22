import React from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";
import PropTypes from "prop-types";
import { images } from "../Images";

const Icon = styled.Image`
  tint-color: ${({ theme }) => theme.text};
  width: 30px;
  height: 30px;
  margin: 10px;
`;
const IconButton = ({ type, id, onPressOut }) => {
  const h_onPressOut = () => {
    onPressOut(id);
  };

  return (
    <Pressable onPressOut={h_onPressOut}>
      <Icon source={type} />
    </Pressable>
  );
};

//컴포넌트를 사용하는 다른 부분에서 필수적으로 제공해야 하는 속성들에 대한 안전장치
IconButton.defaultProps = {
  onPressOut: () => {},
};

IconButton.propTypes = {
  type: PropTypes.oneOf(Object.values(images)).isRequired,
  onPressOut: PropTypes.func,
  id: PropTypes.string,
};

export default IconButton;
