import { FC } from 'react';
import { Empty, Layout } from 'antd-v5';
import { useParams } from 'react-router-dom';
import { getUrlParam } from '../../utils/urlUtils';
import { URL_PARAMS } from '../../constants';
import DashboardPage from '../../dashboard/containers/DashboardPage';
import FolderSidebar from './sidebar';

const DashboardRoute: FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const standalone = getUrlParam(URL_PARAMS.standalone);
  const isEdit = getUrlParam(URL_PARAMS.edit);
  const height = standalone ? '100vh' : 'calc(100vh - 55px)';
  return (
    <Layout
      style={{
        height,
        overflowY: 'auto',
      }}
    >
      {!standalone && !isEdit && (
        <Layout.Sider
          theme="light"
          className="h-full ml-[2px] border-r-[1px] border-r-[#edeffa] "
          width={300}
        >
          <FolderSidebar />
        </Layout.Sider>
      )}
      <Layout.Content
        style={{
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {idOrSlug ? (
          <DashboardPage idOrSlug={idOrSlug} />
        ) : (
          <Layout style={{ height: '100%' }}>
            <Layout.Content
              style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Empty description="Please select a dashboard" />
            </Layout.Content>
          </Layout>
        )}
      </Layout.Content>
    </Layout>
  );
};

export default DashboardRoute;
