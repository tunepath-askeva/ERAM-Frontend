import React from "react";
import { Skeleton, Card, Row, Col } from "antd";

const SkeletonLoader = () => {
  return (
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
        <Col xs={24} sm={24} md={12} lg={12} xl={8} key={item}>
          <Card style={{ height: "100%" }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SkeletonLoader;
