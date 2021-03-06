// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  nbformat
} from '@jupyterlab/services';

import {
  IRenderMime
} from 'jupyterlab/lib/rendermime';

import {
  JSONValue
} from 'phosphor/lib/algorithm/json';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  PanelLayout
} from 'phosphor/lib/ui/panel';

import {
  valueIn
} from '../../common/util';

import {
   RenderableDiffModel
} from '../model';



/**
 * A list of outputs considered safe.
 */
const safeOutputs = ['text/plain', 'text/latex', 'image/png', 'image/jpeg',
                    'application/vnd.jupyter.console-text'];

/**
 * A list of outputs that are sanitizable.
 */
const sanitizable = ['text/svg', 'text/html'];

/**
 * Widget for outputs with renderable MIME data.
 */
export
abstract class RenderableDiffView<T extends JSONValue> extends Widget {
  constructor(model: RenderableDiffModel<T>, editorClass: string[],
              rendermime: IRenderMime) {
    super();
    this._rendermime = rendermime;
    let bdata = model.base;
    let rdata = model.remote;
    this.layout = new PanelLayout();

    let ci = 0;
    if (bdata) {
      let widget = this.createSubView(bdata, false);
      this.layout.addWidget(widget);
      widget.addClass(editorClass[ci++]);
    }
    if (rdata && rdata !== bdata) {
      let widget = this.createSubView(rdata, false);
      this.layout.addWidget(widget);
      widget.addClass(editorClass[ci++]);
    }
  }

  /**
   * Checks if all MIME types of a MIME bundle are safe or can be sanitized.
   */
  static safeOrSanitizable(bundle: nbformat.IMimeBundle) {
    let keys = Object.keys(bundle);
    for (let key of keys) {
      if (valueIn(key, safeOutputs)) {
        continue;
      } else if (valueIn(key, sanitizable)) {
        let out = bundle[key];
        if (typeof out === 'string') {
          continue;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  layout: PanelLayout;

  /**
   * Create a widget which renders the given cell output
   */
  protected abstract createSubView(data: T, trusted: boolean): Widget;

  _sanitized: boolean;
  _rendermime: IRenderMime;
}
