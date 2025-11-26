import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface Flashcard {
  id: string;
  question: string;
  subjectId?: string;
  topicId?: string;
}

interface DeleteFlashCardModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  flashcard: Flashcard | null;
}

const DeleteFlashCardModal: React.FC<DeleteFlashCardModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  flashcard,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <ExclamationCircleFilled className="text-red-500 text-xl mr-2" />
          <span>Delete Flashcard</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="delete" 
          type="primary" 
          danger 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete
        </Button>,
      ]}
      width={500}
    >
      <div className="py-4">
        <p className="text-gray-700">
          Are you sure you want to delete this flashcard?
        </p>
        {flashcard && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="font-medium">{flashcard.question}</p>
          </div>
        )}
        <p className="mt-4 text-gray-600">
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteFlashCardModal;