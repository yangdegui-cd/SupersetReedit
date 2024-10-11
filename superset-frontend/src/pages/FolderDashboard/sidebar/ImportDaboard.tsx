import { t } from '@superset-ui/core';
import ImportModelsModal from 'src/components/ImportModal';
// eslint-disable-next-line no-restricted-syntax
import React, { useState } from 'react';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import {
  CONFIRM_OVERWRITE_MESSAGE,
  PASSWORDS_NEEDED_MESSAGE,
} from '../../../features/datasets/constants';

export default function ImportDashboardModal({
  open,
  setOpen,
  refreshData,
}: {
  open: boolean;
  setOpen: Function;
  refreshData: () => void | undefined;
}) {
  const { addDangerToast, addSuccessToast } = useToasts();
  const [passwordFields, setPasswordFields] = useState<string[]>([]);
  const [sshTunnelPasswordFields, setSSHTunnelPasswordFields] = useState<
    string[]
  >([]);
  const [sshTunnelPrivateKeyFields, setSSHTunnelPrivateKeyFields] = useState<
    string[]
  >([]);
  const [
    sshTunnelPrivateKeyPasswordFields,
    setSSHTunnelPrivateKeyPasswordFields,
  ] = useState<string[]>([]);

  const closeDashboardImportModal = () => {
    setOpen(false);
  };

  const handleDashboardImport = () => {
    setOpen(false);
    refreshData();
    addSuccessToast(t('Dashboard imported'));
  };

  return (
    <ImportModelsModal
      resourceName="dashboard"
      resourceLabel={t('dashboard')}
      passwordsNeededMessage={PASSWORDS_NEEDED_MESSAGE}
      confirmOverwriteMessage={CONFIRM_OVERWRITE_MESSAGE}
      addDangerToast={addDangerToast}
      addSuccessToast={addSuccessToast}
      onModelImport={handleDashboardImport}
      show={open}
      onHide={closeDashboardImportModal}
      passwordFields={passwordFields}
      setPasswordFields={setPasswordFields}
      sshTunnelPasswordFields={sshTunnelPasswordFields}
      setSSHTunnelPasswordFields={setSSHTunnelPasswordFields}
      sshTunnelPrivateKeyFields={sshTunnelPrivateKeyFields}
      setSSHTunnelPrivateKeyFields={setSSHTunnelPrivateKeyFields}
      sshTunnelPrivateKeyPasswordFields={sshTunnelPrivateKeyPasswordFields}
      setSSHTunnelPrivateKeyPasswordFields={
        setSSHTunnelPrivateKeyPasswordFields
      }
    />
  );
}
