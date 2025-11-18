"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const Loader = () => {
  console.log("hihihih");
  return (
    <div className="absolute h-screen w-screen bg-[#000000] bg-opacity-30 flex items-center justify-center">
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
        size="large"
      />
    </div>
  );
};

export default Loader;
