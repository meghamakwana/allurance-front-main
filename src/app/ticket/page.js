'use client';
import { useState, useEffect, useCallback } from 'react';
import data from "../../jsondata/Address.json";
import ProfileListView from "src/component/ProfileListView";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "src/component/Header";
import Footer from "src/component/Footer";
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_TICKET } from "../../utils/frontendAPIEndPoints";
import { getDecodedToken, getOnlyToken, getUserLoginSession, formatDateFn, getTicketListData } from "../../utils/frontendCommonFunction";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';

function TicketList() {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);
  const [listTicketData, getTicketData] = useState([]);

  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data.id) {
      enqueueSnackbar("Something Wrong! Please login to continue access", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedlogtkn);
  }, []);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;


  // Fetch Ticket List
  useEffect(() => {
    const fetchData = async () => {
      if (isUserLoggedIn) {
        try {
          const data1 = await getTicketListData(isUserLoggedIn);
          if (data1.data.length) {
            getTicketData(data1.data);
          }
        } catch (error) {
          console.error("Error fetching ticket data:", error);
        }
      }
    };

    fetchData();
  }, [isUserLoggedIn]);


  return (
    <>
      <>
        <Header />
        {data?.Address?.map((item) => {
          return (
            <div id="myProfile" key="TicketList">
              <div className="container">
                <div className="row">
                  <ProfileListView />
                  <div className="col-md-9">
                    <div id="addressSection">
                      <div className="address-title">
                        <h3>List Of Tickets ({listTicketData && listTicketData.length ? listTicketData.length : 0})</h3>
                        <Link href="/ticket/add" className="btn new-address-btn">Add New</Link>
                      </div>

                      {listTicketData && listTicketData.length > 0 ? (
                        listTicketData.map((listTicketDatas, index) => {
                          return (
                            <div key={listTicketDatas.id}>
                              <div className="default-address-section mb-2">
                                <p>Ticket ID: {listTicketDatas.ticket_id}</p>
                                <p>Subject: {listTicketDatas.subject_title}</p>
                                <p>Title: <Link href={`/ticket/${listTicketDatas.id}`}>{listTicketDatas.title}</Link></p>
                                <p>Created: {formatDateFn(listTicketDatas.created_at)}</p>
                                <p>Status: {listTicketDatas.ticket_status === 1 ? 'Open' : 'Closed'}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div><center>Sorry, Records Not Found.</center></div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <Footer />
      </>
    </>
  );
}

export default TicketList;
