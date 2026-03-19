<div class="modal fade" id="modalProduto" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content modal-produto-premium">

      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title" id="mp-nome"></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">

        <!-- LOADING -->
        <div id="mp-loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- CONTEÚDO -->
        <div id="mp-content" style="display:none">

          <div class="row g-3">

            <!-- IMAGEM -->
            <div class="col-md-5 text-center">
              <img id="mp-img" class="img-produto-premium">
              <div class="badge bg-primary mt-2" id="mp-categoria"></div>
            </div>

            <!-- INFO -->
            <div class="col-md-7">

              <!-- PREÇOS -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="price-box">
                    <small>Compra</small>
                    <strong id="mp-compra"></strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="price-box venda">
                    <small>Venda</small>
                    <strong id="mp-venda"></strong>
                  </div>
                </div>
              </div>

              <!-- DADOS -->
              <div class="info-grid">
                <div><span>Código</span><strong id="mp-codigo"></strong></div>
                <div><span>Unidade</span><strong id="mp-unidade"></strong></div>
                <div><span>NCM</span><strong id="mp-ncm"></strong></div>
                <div><span>Status</span><strong id="mp-status"></strong></div>
              </div>

            </div>
          </div>

        </div>

        <!-- ERRO -->
        <div id="mp-error" class="alert alert-danger" style="display:none">
          Erro ao carregar produto
        </div>

      </div>
    </div>
  </div>
</div>
