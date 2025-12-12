
import React from "react";
import { Modal, Form, Select, Input, Button, Row, Col } from "antd";
import { Work_Sans } from "next/font/google";
import styles from "./AddMentor.module.css";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

interface AddSessionCardModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: (values: any) => void;
}

const AddSessionCardModal: React.FC<AddSessionCardModalProps> = ({
    open,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm();

    const handleSave = () => {
        form
            .validateFields()
            .then((values) => {
                onSave(values);
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            centered
            width={600}
            className={worksans.className}
            closeIcon={null}
        >
            <div className={`flex flex-col gap-6 p-2 ${worksans.className}`}>
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-[#1E4640] text-2xl font-semibold m-0">
                        Add Session Card
                    </h2>
                    <p className="text-gray-500 text-sm m-0">
                        Set fee for selected duration (Admin only)
                    </p>
                </div>

                <Form form={form} layout="vertical" className="w-full">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="duration"
                                label={
                                    <span className="text-[#1E4640] font-semibold text-base">
                                        Duration
                                    </span>
                                }
                                rules={[{ required: true, message: "Select duration" }]}
                            >
                                <Select
                                    placeholder="Set duration"
                                    className={`h-[45px] ${styles.customSelect}`}
                                    popupClassName={worksans.className}
                                    options={[
                                        { value: 30, label: "30 Mins" },
                                        { value: 60, label: "1 Hours" },
                                        { value: 90, label: "1.5 Hours" },
                                        { value: 120, label: "2 Hours" },
                                    ]}
                                    // Ant Design Select styling override often needs global or deep selectors, 
                                    // but we can try to wrap it or use the class.
                                    // For now using standard Select, we might need to style it to match the 'Input' look exactly.
                                    style={{ width: '100%' }}
                                    getPopupContainer={(trigger) => trigger.parentNode}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="fees"
                                label={
                                    <span className="text-[#1E4640] font-semibold text-base">
                                        Fees
                                    </span>
                                }
                                rules={[{ required: true, message: "Enter session rate" }]}
                            >
                                <Input
                                    placeholder="Session rate"
                                    className={`p-3 rounded-lg border border-gray-200 ${styles.customInput}`}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Footer Buttons */}
                    <div className="flex justify-center gap-4 mt-4">
                        <Button
                            onClick={handleCancel}
                            className={`w-full max-w-[200px] h-[50px] rounded-xl border border-[#1E4640] text-[#1E4640] font-semibold text-lg ${styles.customButton}`}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            className={`w-full max-w-[200px] h-[50px] rounded-xl bg-[#1E4640] text-white font-semibold text-lg ${styles.customPrimaryButton}`}
                        >
                            Save
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};

export default AddSessionCardModal;
