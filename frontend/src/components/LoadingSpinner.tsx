import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const LoadingSpinner = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 34 }} spin />;

  return (
    <div className="flex items-center justify-center">
      <Spin indicator={antIcon} />
    </div>
  );
};

export default LoadingSpinner;
