import config from "./config.js";
import "./App.css";
import HeadedPage from "./HeadedPage.js";
import ListTable from "./crudtemplates/ListTable.js";
import ViewObjectPage from "./crudtemplates/ViewObjectPage.js";
import AddEditObjectPage from "./crudtemplates/AddEditObjectPage.js";
import Dashboard from "./crudtemplates/Dashboard.js";
import Tabs from "./crudtemplates/Tabs.js";
import AuditLog from "./crudtemplates/AuditLog.js";
import schemas from "./schema.js";
import ErrorHandler from "./ErrorHandler.js";
import SearchSequencing from "./SearchSequencing.js";
import React, { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { getCookie } from "./crudtemplates/utils.js";
import SequencingResults from "./crudtemplates/SequencingResults.js";
import BlastResults from "./crudtemplates/BlastResults.js";

if (process.env.REACT_APP_SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: window._environment,
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Antigens", href: "/antigens" },
  { name: "Llamas", href: "/llamas" },
  { name: "Sequencing", href: "/sequencing" },
  // { name: "Nanobodies", href: "/nanobodies" },
];
const userNavigation = [
  // { name: 'Your Profile', href: '#' },
  // { name: 'Settings', href: '#' },
  // { name: 'Sign out', href: '#' },
];
const CONNECTION_TIMEOUT = 5000;

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const App = () => {
  const [csrfToken, setCsrfToken] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: "",
    email: "",
    username: "",
  });

  useEffect(() => {
    const getCSRF = () => {
      // 5 second timeout
      const controller = new AbortController();
      setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);

      fetch(config.url.API_URL + "/", {
        signal: controller.signal,
        credentials: "same-origin",
      })
        .then(() => {
          const csrfToken = getCookie("csrftoken");
          if (!csrfToken) {
            setError(
              "CSRF cookie not set. Please refresh the page and check your cookie settings if this message persists.",
            );
          }
          setCsrfToken(csrfToken);
          // setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.message?.includes("NetworkError")) {
            setError(
              "Unable to contact server. Please check your connection and refresh.",
            );
          }
          if (err.message?.includes("The operation was aborted")) {
            setError(
              "Timeout connecting to server. Please check your connection and refresh.",
            );
          }
          // setLoading(false);
        });
    };

    const refreshUserInfo = () => {
      fetch("/oauth2/userinfo").then((res) => {
        if (res.status === 401) {
          // session has expired, reload
          window.location.reload();
        } else if (res.status === 200) {
          res.json().then((data) => {
            if (
              user.username !== "" &&
              user.username !== data.preferredUsername
            ) {
              // User ID has changed, do a reload
              window.location.reload();
            }
            setUser({
              name: "",
              email: data.email,
              username: data.preferredUsername,
            });
          });
        }
      });
    };

    getCSRF();
    refreshUserInfo();

    document.onvisibilitychange = () => {
      // Check the auth session is still valid
      if (document.visibilityState === "visible") {
        refreshUserInfo();
      }
    };

    // Next line disables eslint warning about deps - we only
    // want to run this hook on page load rather than when
    // anything is updated

    // When editing anything in this useEffect, you might
    // want to run eslint manually with the pragma removed
    // to check that "user" is the only missing dependency
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="min-h-full">
        <Router>
          <Disclosure as="nav" className="bg-gray-800">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-8 w-8"
                          src="/antigen-llama.svg"
                          alt="AntigenApp"
                        />
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                          {navigation.map((item) => (
                            <NavLink
                              key={item.name}
                              to={item.href}
                              href="#"
                              className={({ isActive }) =>
                                classNames(
                                  isActive
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                  "px-3 py-2 rounded-md text-sm font-medium",
                                )
                              }
                              aria-current={item.current ? "page" : undefined}
                            >
                              {item.name}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-4 flex items-center md:ml-6">
                        {/* <button
                        type="button"
                        className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button> */}

                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                          <div>
                            <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 font-bold text-white">
                              <span className="sr-only">Open user menu</span>
                              {user.username}
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {userNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <a
                                      href={item.href}
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700",
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="md:hidden">
                  <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                    {navigation.map((item) => (
                      <NavLink key={item.name} to={item.href}>
                        <Disclosure.Button
                          href="#"
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "block px-3 py-2 rounded-md text-base font-medium",
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Disclosure.Button>
                      </NavLink>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 pt-4 pb-3">
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0 text-white font-bold">
                        {user.username}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-white">
                          {user.name}
                        </div>
                        <div className="text-sm font-medium leading-none text-gray-400">
                          {user.email}
                        </div>
                      </div>
                      {/* <button
                      type="button"
                      className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button> */}
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Replace with your content */}
          {/* <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" />
          </div> */}
          {/* /End replace */}
          {error && <ErrorHandler error={error} onSetError={setError} />}
          <Routes>
            <Route
              exact
              path="/"
              element={
                <HeadedPage title="Dashboard">
                  <Dashboard onSetError={setError} />
                </HeadedPage>
              }
            />

            <Route
              exact
              path="/projects"
              element={
                <HeadedPage title="Projects">
                  <ListTable
                    schema={schemas.project}
                    onSetError={setError}
                  ></ListTable>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/projects/add"
              element={
                <HeadedPage title="Add Project">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.project}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/projects/:recordId"
              element={
                <HeadedPage title="View Project">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Project Information"
                      schema={schemas.project}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <ListTable
                      tabName="Libraries"
                      schema={schemas.library}
                      onSetError={setError}
                    ></ListTable>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.project}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/projects/:recordId/edit"
              element={
                <HeadedPage title="Edit Project">
                  <AddEditObjectPage
                    schema={schemas.project}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            <Route
              exact
              path="/cohorts/add"
              element={
                <HeadedPage title="Add Cohort">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.cohort}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/cohorts/:recordId"
              element={
                <HeadedPage title="View Cohort">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Cohort Information"
                      schema={schemas.cohort}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <ListTable
                      tabName="Elisas"
                      schema={schemas.elisa}
                      filterField="library__cohort"
                      onSetError={setError}
                      readOnly={true}
                    ></ListTable>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.cohort}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/cohorts/:recordId/edit"
              element={
                <HeadedPage title="Edit Cohort">
                  <AddEditObjectPage
                    schema={schemas.cohort}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            <Route
              exact
              path="/libraries/add"
              element={
                <HeadedPage title="Add Library">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.library}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/libraries/:recordId"
              element={
                <HeadedPage title="View Library">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Library Information"
                      schema={schemas.library}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <ListTable
                      tabName="Elisas"
                      schema={schemas.elisa}
                      onSetError={setError}
                    ></ListTable>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.library}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/libraries/:recordId/edit"
              element={
                <HeadedPage title="Edit Library">
                  <AddEditObjectPage
                    schema={schemas.library}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            <Route
              exact
              path="/elisas/add"
              element={
                <HeadedPage title="Add ELISA">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.elisa}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/elisas/:recordId"
              element={
                <HeadedPage title="View ELISA">
                  <Tabs>
                    <ViewObjectPage
                      tabName="ELISA"
                      schema={schemas.elisa}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.elisa}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/elisas/:recordId/edit"
              element={
                <HeadedPage title="Edit ELISA">
                  <AddEditObjectPage
                    schema={schemas.elisa}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            <Route
              exact
              path="/antigens"
              element={
                <HeadedPage title="Antigens">
                  <ListTable
                    schema={schemas.antigen}
                    onSetError={setError}
                  ></ListTable>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/antigens/add"
              element={
                <HeadedPage title="Add Antigen">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.antigen}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/antigens/:recordId"
              element={
                <HeadedPage title="View Antigen">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Antigen"
                      schema={schemas.antigen}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.antigen}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/antigens/:recordId/edit"
              element={
                <HeadedPage title="Edit Antigen">
                  <AddEditObjectPage
                    schema={schemas.antigen}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            <Route
              exact
              path="/llamas"
              element={
                <HeadedPage title="Llamas">
                  <ListTable
                    schema={schemas.llama}
                    onSetError={setError}
                  ></ListTable>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/llamas/add"
              element={
                <HeadedPage title="Add Llama">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.llama}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/llamas/:recordId"
              element={
                <HeadedPage title="View Llama">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Llama Information"
                      schema={schemas.llama}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <ListTable
                      tabName="Cohorts"
                      schema={schemas.cohort}
                      onSetError={setError}
                    ></ListTable>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.llama}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/llamas/:recordId/edit"
              element={
                <HeadedPage title="Edit Llama">
                  <AddEditObjectPage
                    schema={schemas.llama}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            {/* Sequencing */}
            <Route
              exact
              path="/sequencing"
              element={
                <HeadedPage title="Sequencing Runs">
                  <ListTable
                    schema={schemas.sequencing}
                    onSetError={setError}
                    extraButton={
                      <>
                        <a href="/api/fasta">
                          <button
                            type="button"
                            className="w-full sm:w-auto mr-2 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                          >
                            Download DB (FASTA)
                          </button>
                        </a>
                        <NavLink to={"/sequencing/search"}>
                          <button
                            type="button"
                            className="w-full sm:w-auto mr-2 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                          >
                            Search by CDR3
                          </button>
                        </NavLink>
                      </>
                    }
                  ></ListTable>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/sequencing/add"
              element={
                <HeadedPage title="Add Sequencing Run">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.sequencing}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/sequencing/:recordId"
              element={
                <HeadedPage title="View Sequencing Run">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Sequencing Run Information"
                      schema={schemas.sequencing}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <SequencingResults
                      tabName="Results"
                      schema={schemas.sequencing}
                      onSetError={setError}
                    ></SequencingResults>
                    <BlastResults
                      tabName="BLAST"
                      schema={schemas.sequencing}
                      onSetError={setError}
                    ></BlastResults>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.sequencing}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/sequencing/:recordId/edit"
              element={
                <HeadedPage title="Edit Sequencing Run">
                  <AddEditObjectPage
                    schema={schemas.sequencing}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/sequencing/search"
              element={
                <HeadedPage title="Search by Sequence">
                  <SearchSequencing onSetError={setError} />
                </HeadedPage>
              }
            />

            {/* Nanobodies */}
            <Route
              exact
              path="/nanobodies"
              element={
                <HeadedPage title="Nanobodies">
                  <ListTable
                    schema={schemas.nanobody}
                    onSetError={setError}
                  ></ListTable>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/nanobodies/add"
              element={
                <HeadedPage title="Add Nanobody">
                  <AddEditObjectPage
                    onSetError={setError}
                    schema={schemas.nanobody}
                    csrfToken={csrfToken}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/nanobodies/:recordId"
              element={
                <HeadedPage title="View Nanobody">
                  <Tabs>
                    <ViewObjectPage
                      tabName="Nanobody Information"
                      schema={schemas.nanobody}
                      onSetError={setError}
                      csrfToken={csrfToken}
                    ></ViewObjectPage>
                    <AuditLog
                      tabName="Audit Log"
                      schema={schemas.nanobody}
                      onSetError={setError}
                    ></AuditLog>
                  </Tabs>
                </HeadedPage>
              }
            />
            <Route
              exact
              path="/nanobodies/:recordId/edit"
              element={
                <HeadedPage title="Edit Nanobody">
                  <AddEditObjectPage
                    schema={schemas.nanobody}
                    csrfToken={csrfToken}
                    onSetError={setError}
                  ></AddEditObjectPage>
                </HeadedPage>
              }
            />

            <Route
              path="*"
              element={
                <HeadedPage title="404 Not Found">Page not found</HeadedPage>
              }
            />
          </Routes>
        </Router>
      </div>
    </>
  );
};

export default App;
