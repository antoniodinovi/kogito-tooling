/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Button,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownPosition,
  TextInput,
  Title,
  PageHeaderTools,
  PageHeaderToolsItem,
  PageHeaderToolsGroup,
  PageHeader,
  Brand,
  Tooltip,
  DropdownToggle
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import * as React from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import { GlobalContext } from "../common/GlobalContext";
import { useLocation } from "react-router";
import { useOnlineI18n } from "../common/i18n";

interface Props {
  onFileNameChanged: (fileName: string, fileExtension: string) => void;
  onFullScreen: () => void;
  onSave: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onSetGitHubToken: () => void;
  onGistIt: () => void;
  onEmbed: () => void;
  onClose: () => void;
  onCopyContentToClipboard: () => void;
  isPageFullscreen: boolean;
  isEdited: boolean;
}

export function EditorToolbar(props: Props) {
  const context = useContext(GlobalContext);
  const location = useLocation();
  const [fileName, setFileName] = useState(context.file.fileName);
  const [isShareMenuOpen, setShareMenuOpen] = useState(false);
  const [isViewKebabOpen, setViewKebabOpen] = useState(false);
  const [isKebabOpen, setKebabOpen] = useState(false);
  const { i18n } = useOnlineI18n();

  const logoProps = useMemo(() => {
    return { onClick: props.onClose };
  }, [props.onClose]);

  const fileExtension = useMemo(() => {
    return context.file.fileExtension;
  }, [location]);

  const saveNewName = useCallback(() => {
    props.onFileNameChanged(fileName, fileExtension);
  }, [props.onFileNameChanged, fileName, fileExtension]);

  const cancelNewName = useCallback(() => {
    setFileName(context.file.fileName);
  }, [context.file.fileName]);

  const onNameInputKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.keyCode === 13 /* Enter */) {
        saveNewName();
        e.currentTarget.blur();
      } else if (e.keyCode === 27 /* ESC */) {
        cancelNewName();
        e.currentTarget.blur();
      }
    },
    [saveNewName, cancelNewName]
  );

  const viewItems = useCallback(
    (dropdownId: string) => [
      <React.Fragment key={`dropdown-${dropdownId}-close`}>
        {!context.external && (
          <DropdownItem
            component={"button"}
            onClick={props.onClose}
            aria-label={"Close"}
            data-testid={"close-editor-button"}
          >
            {i18n.editorToolbar.closeAndReturnHome}
          </DropdownItem>
        )}
      </React.Fragment>,
      <DropdownItem key={`dropdown-${dropdownId}-fullscreen`} component={"button"} onClick={props.onFullScreen}>
        {i18n.editorToolbar.enterFullScreenView}
      </DropdownItem>
    ],
    [i18n, context, props.onClose, props.onFullScreen]
  );

  const shareItems = useCallback(
    (dropdownId: string) => [
      <DropdownItem
        key={`dropdown-${dropdownId}-save`}
        component={"button"}
        onClick={props.onDownload}
        className={"pf-u-display-none-on-xl"}
      >
        {i18n.editorToolbar.saveAndDownload}
      </DropdownItem>,
      <DropdownItem
        key={`dropdown-${dropdownId}-copy-source`}
        component={"button"}
        onClick={props.onCopyContentToClipboard}
      >
        {i18n.editorToolbar.copySource}
      </DropdownItem>,
      <DropdownItem key={`dropdown-${dropdownId}-download-svg`} component="button" onClick={props.onPreview}>
        {i18n.editorToolbar.downloadSVG}
      </DropdownItem>,
      <DropdownItem key={`dropdown-${dropdownId}-embed`} component="button" onClick={props.onEmbed}>
        {i18n.editorToolbar.embed}
      </DropdownItem>,
      <DropdownGroup key={"github-group"} label={i18n.names.github}>
        <React.Fragment key={`dropdown-${dropdownId}-fragment`}>
          <Tooltip
            data-testid={"gist-it-tooltip"}
            key={`dropdown-${dropdownId}-export-gist`}
            content={<div>{i18n.editorToolbar.gistItTooltip}</div>}
            trigger={!context.githubService.isAuthenticated() ? "mouseenter click" : ""}
          >
            <DropdownItem
              data-testid={"gist-it-button"}
              component="button"
              onClick={props.onGistIt}
              isDisabled={!context.githubService.isAuthenticated()}
            >
              {i18n.editorToolbar.gistIt}
            </DropdownItem>
          </Tooltip>
          {context.external && !context.readonly && (
            <DropdownItem
              key={`dropdown-${dropdownId}-send-changes-to-github`}
              component={"button"}
              onClick={props.onSave}
            >
              {i18n.editorToolbar.sendChangesToGitHub}
            </DropdownItem>
          )}
        </React.Fragment>
        <DropdownItem
          data-testid={"set-github-token"}
          key={`dropdown-${dropdownId}-setup-github-token`}
          component="button"
          onClick={props.onSetGitHubToken}
        >
          {i18n.editorToolbar.setGitHubToken}
        </DropdownItem>
      </DropdownGroup>
    ],
    [i18n, context, props.onSave, props.onDownload, props.onCopyContentToClipboard, props.onGistIt]
  );

  return !props.isPageFullscreen ? (
    <PageHeader
      logo={<Brand src={`images/${fileExtension}_kogito_logo.svg`} alt={`${fileExtension} kogito logo`} />}
      logoProps={logoProps}
      headerTools={
        <PageHeaderTools>
          <PageHeaderToolsGroup>
            <PageHeaderToolsItem
              visibility={{
                default: "hidden",
                "2xl": "visible",
                xl: "visible",
                lg: "hidden",
                md: "hidden",
                sm: "hidden"
              }}
            >
              <Button
                data-testid="save-button"
                variant={"primary"}
                onClick={props.onDownload}
                aria-label={"Save and Download button"}
                className={"kogito--editor__toolbar button"}
              >
                {i18n.editorToolbar.saveAndDownload}
              </Button>
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
          <PageHeaderToolsGroup>
            <PageHeaderToolsItem
              visibility={{
                default: "hidden",
                "2xl": "visible",
                xl: "visible",
                lg: "hidden",
                md: "hidden",
                sm: "hidden"
              }}
            >
              <Dropdown
                onSelect={() => setShareMenuOpen(false)}
                toggle={
                  <DropdownToggle
                    id={"share-id-lg"}
                    data-testid={"share-menu"}
                    onToggle={isOpen => setShareMenuOpen(isOpen)}
                  >
                    {i18n.editorToolbar.share}
                  </DropdownToggle>
                }
                isPlain={true}
                className={"kogito--editor__toolbar dropdown"}
                isOpen={isShareMenuOpen}
                dropdownItems={shareItems("lg")}
                position={DropdownPosition.right}
              />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
          <PageHeaderToolsGroup>
            <PageHeaderToolsItem
              visibility={{
                default: "hidden",
                "2xl": "visible",
                xl: "visible",
                lg: "hidden",
                md: "hidden",
                sm: "hidden"
              }}
            >
              <Dropdown
                onSelect={() => setViewKebabOpen(false)}
                toggle={
                  <DropdownToggle
                    data-testid={"view-kebab"}
                    className={"kogito--editor__toolbar-icon-button"}
                    id={"view-id-lg"}
                    toggleIndicator={null}
                    onToggle={isOpen => setViewKebabOpen(isOpen)}
                  >
                    <EllipsisVIcon />
                  </DropdownToggle>
                }
                isOpen={isViewKebabOpen}
                isPlain={true}
                dropdownItems={viewItems("lg")}
                position={DropdownPosition.right}
              />
            </PageHeaderToolsItem>
            <PageHeaderToolsItem
              visibility={{
                default: "visible",
                "2xl": "hidden",
                xl: "hidden",
                lg: "visible",
                md: "visible",
                sm: "visible"
              }}
            >
              <Dropdown
                onSelect={() => setKebabOpen(false)}
                toggle={
                  <DropdownToggle
                    data-testid={"kebab-sm"}
                    className={"kogito--editor__toolbar-icon-button"}
                    id={"kebab-id-sm"}
                    toggleIndicator={null}
                    onToggle={isOpen => setKebabOpen(isOpen)}
                  >
                    <EllipsisVIcon />
                  </DropdownToggle>
                }
                isOpen={isKebabOpen}
                isPlain={true}
                dropdownItems={[
                  ...viewItems("sm"),
                  <DropdownGroup key={"share-group"} label={i18n.editorToolbar.share}>
                    {...shareItems("sm")}
                  </DropdownGroup>
                ]}
                position={DropdownPosition.right}
              />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
        </PageHeaderTools>
      }
      topNav={
        <>
          <div data-testid={"toolbar-title"} className={"kogito--editor__toolbar-name-container"}>
            <Title aria-label={"File name"} headingLevel={"h3"} size={"2xl"}>
              {fileName}
            </Title>
            <TextInput
              value={fileName}
              type={"text"}
              aria-label={"Edit file name"}
              className={"kogito--editor__toolbar-title"}
              onChange={setFileName}
              onKeyUp={onNameInputKeyUp}
              onBlur={saveNewName}
            />
          </div>
          {props.isEdited && (
            <span
              aria-label={"File was edited"}
              className={"kogito--editor__toolbar-edited"}
              data-testid="is-dirty-indicator"
            >
              {` - ${i18n.terms.edited}`}
            </span>
          )}
        </>
      }
      className={"kogito--editor__toolbar"}
      aria-label={"Page header"}
    />
  ) : null;
}
