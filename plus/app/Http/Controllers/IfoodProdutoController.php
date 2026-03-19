<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Utils\IfoodUtil;
use App\Models\IfoodConfig;
use App\Models\Produto;
use App\Models\ProdutoIfood;
use App\Models\CategoriaProdutoIfood;
use App\Models\Localizacao;
use App\Models\ProdutoLocalizacao;
use App\Models\PadraoTributacaoProduto;
use App\Utils\UploadUtil;
use Illuminate\Support\Str;

class IfoodProdutoController extends Controller
{

    protected $util;
    protected $uploadUtil;

    public function __construct(IfoodUtil $util, UploadUtil $uploadUtil)
    {
        $this->util = $util;
        $this->uploadUtil = $uploadUtil;
    }

    public function index(Request $request){
        $config = IfoodConfig::
        where('empresa_id', $request->empresa_id)
        ->first();

        if($config == null){
            session()->flash("flash_error", "Configure o App");
            return redirect()->route('ifood-config.index');
        }

        if($config->catalogId == ""){
            session()->flash("flash_error", "Defina o catalogo!");
            return redirect()->route('ifood-catalogos.index');
        }

        $this->getProdutosIfood($config);

        $data = ProdutoIfood::where('empresa_id', $request->empresa_id)
        ->where('ifood_id', '!=', null)
        ->paginate(__itensPagina());

        return view('ifood_produtos.index', compact('data'));
    }

    private function getProdutosIfood($config){

        $result = $this->util->getCategoriesV2($config);
        // dd($result);
        if(isset($result->message)){
            if($result->message == "token expired"){
                $result = $this->util->oAuthToken($config);
                if(isset($result['success']) && $result['success'] == 1){
                    return redirect()->route('ifood-produtos.index');
                }else{
                    return redirect()->route('ifood-config.index');
                }
            }
        }

        $idsIfood = [];

        foreach($result as $categoria){
            $idsIfood[] = $categoria['id'];

            $categoryItemsResult = $this->util->getCategoryItemsV2($config, $categoria['id']);
            // dd($categoryItemsResult);
            $categoria = CategoriaProdutoIfood::updateOrCreate([
                'empresa_id' => $config->empresa_id,
                'ifood_id' => $categoria['id'],
                'nome' => $categoria['name'],
                'status' => $categoria['status']
            ]);
            if(isset($categoryItemsResult['products'])){
                $items = $categoryItemsResult['items'];
                foreach($categoryItemsResult['products'] as $key => $product){
                    $estoque = $this->util->getStock($config, $product['id']);

                    $dataProduto = [
                        'empresa_id' => $config->empresa_id,
                        'ifood_id' => $product['id'],
                        'ifood_id_aux' => $items[$key]['id'],
                        'nome' => $product['name'],
                        'imagem' => $product['imagePath'],
                        'serving' => $product['serving'],
                        'status' => $items[$key]['status'],
                        'estoque' => isset($estoque['amount']) ? $estoque['amount'] : 0,
                        'descricao' => $product['description'] ?? '',
                        'valor' => $items[$key]['price']['value'],
                        'categoria_produto_ifood_id' => $categoria->id
                    ];

                    $item = ProdutoIfood::where('empresa_id', $config->empresa_id)
                    ->where('ifood_id', $product['id'])->first();

                    if($item == null){
                        $this->cadastrarProduto($dataProduto);
                    }else{
                        $item->ifood_id_aux = $items[$key]['id'];
                        $item->imagem = $product['imagePath'];
                        $item->status = $items[$key]['status'];
                        $item->save();
                    }
                }
            }
        }

        CategoriaProdutoIfood::where('empresa_id', $config->empresa_id)
        ->whereNotIn('ifood_id', $idsIfood)
        ->update([
            'status' => 0
        ]);
    }

    public function destroy($id){
        $item = ProdutoIfood::findOrFail($id);
        __validaObjetoEmpresa($item);
        $config = IfoodConfig::
        where('empresa_id', request()->empresa_id)
        ->first();

        $result = $this->util->destroyProduct($config, $item->ifood_id);
        if($result == null){
            $item->delete();
            session()->flash("flash_success", "Produto removido!");
        }else{
            session()->flash("flash_error", "Algo deu errado: " . $result->error->message);
        }
        return redirect()->back();
    }

    private function cadastrarProduto($data){
        $padraoTributacaoProduto = PadraoTributacaoProduto::where('padrao', 1)
        ->where('empresa_id', $data['empresa_id'])->first();
        $dataProduto = [
            'ifood_id' => $data['ifood_id'],
            'empresa_id' => $data['empresa_id'],
            'nome' => $data['nome'],
            'valor_unitario' => $data['valor'],
        ];

        if($padraoTributacaoProduto){
            $dataProduto['perc_icms'] = $padraoTributacaoProduto->perc_icms;
            $dataProduto['perc_pis'] = $padraoTributacaoProduto->perc_pis;
            $dataProduto['perc_cofins'] = $padraoTributacaoProduto->perc_cofins;
            $dataProduto['perc_ipi'] = $padraoTributacaoProduto->perc_ipi;
            $dataProduto['cst_csosn'] = $padraoTributacaoProduto->cst_csosn;
            $dataProduto['cst_pis'] = $padraoTributacaoProduto->cst_pis;
            $dataProduto['cst_cofins'] = $padraoTributacaoProduto->cst_cofins;
            $dataProduto['cst_ipi'] = $padraoTributacaoProduto->cst_ipi;
            $dataProduto['perc_red_bc'] = $padraoTributacaoProduto->perc_red_bc;
            $dataProduto['cEnq'] = $padraoTributacaoProduto->cEnq;
            $dataProduto['pST'] = $padraoTributacaoProduto->pST;
            $dataProduto['cfop_estadual'] = $padraoTributacaoProduto->cfop_estadual;
            $dataProduto['cfop_outro_estado'] = $padraoTributacaoProduto->cfop_outro_estado;
            $dataProduto['cest'] = $padraoTributacaoProduto->cest;
            $dataProduto['ncm'] = $padraoTributacaoProduto->ncm;
            $dataProduto['cfop_entrada_estadual'] = $padraoTributacaoProduto->cfop_entrada_estadual;
            $dataProduto['cfop_entrada_outro_estado'] = $padraoTributacaoProduto->cfop_entrada_outro_estado;
        }

        $produto = Produto::create($dataProduto);

        $locais = Localizacao::where('empresa_id', $data['empresa_id'])->get();
        foreach($locais as $l){
            ProdutoLocalizacao::updateOrCreate([
                'produto_id' => $produto->id, 
                'localizacao_id' => $l->id
            ]);
        }

        $data['produto_id'] = $produto->id;
        ProdutoIfood::create($data);
    }

    public function edit($id){
        $item = ProdutoIfood::findOrFail($id);
        __validaObjetoEmpresa($item);
        $config = IfoodConfig::where('empresa_id', request()->empresa_id)->first();
        if(empty($config->catalogId)){
            session()->flash("flash_error", "Nenhum catálogo definido para esta empresa. Por favor, defina um catálogo na tela de configurações do iFood.");
            return redirect()->route('ifood-config.index');
        }
        $categorias = CategoriaProdutoIfood::where('empresa_id', $item->empresa_id)->get();
        return view('ifood_produtos.edit', compact('item', 'config', 'categorias'));
    }

    public function update(Request $request, $id){

        $item = ProdutoIfood::findOrFail($id);
        $data = [
            'name' => $request->nome,
            'description' => $request->descricao ?? '',
            'ean' => $request->codigo_barras ?? '',
            'serving' => $item->serving,
            // 'image' => $item->imagem
        ];
        try{

            if ($request->hasFile('image')) {
                $file = $request->file('image');

                $ext = $file->getClientOriginalExtension();
                $file_name = Str::random(20) . '.' . $ext;

                $path = public_path('uploads/produtos');
                $file->move($path, $file_name);

                $produto = $item->produto;
                $produto->imagem = $file_name;
                $produto->save();

                $imagePath = $path . '/' . $file_name;

                $pathImage = public_path('uploads/produtos/'.$produto->imagem);

                $mimeType = explode(".", $produto->imagem);
                $image = "data:image/$mimeType[1];base64,".base64_encode(file_get_contents($pathImage));
                $data['image'] = $image;
            }else{
                $produto = $item->produto;
                $pathImage = public_path('uploads/produtos/'.$produto->imagem);
                if(file_exists($pathImage) && $produto->imagem){
                    $mimeType = explode(".", $produto->imagem);
                    $image = "data:image/$mimeType[1];base64,".base64_encode(file_get_contents($pathImage));
                    $data['image'] = $image;
                }
            }
            $config = IfoodConfig::where('empresa_id', request()->empresa_id)->first();
            $result = $this->util->updateProduct($config, $data, $item->ifood_id);

            if(isset($result->error)){
                session()->flash("flash_error", $result->error->details[0]->message);
                return redirect()->back();
            }

            if(isset($result->name)){
                $item->nome = $result->name;
                $item->descricao = $result->description;
                $item->status = $request->status;
                $produto = $item->produto;
                $produto->nome = $result->name;
                $produto->codigo_barras = $result->ean;
                $item->save();
                $produto->save();
            }
            $data = [
                'status' => $request->status,
            ];

            $result = $this->util->updateStatusProduct($config, $data, $item->ifood_id_aux);
            session()->flash("flash_success", "Produto cadastrado com sucesso!");
        }catch(\Exception $e){
            session()->flash("flash_error", "Algo deu errado: " . $e->getMessage());
        }
        return redirect()->route('ifood-produtos.index');
    }

    public function active($id){
        $item = ProdutoIfood::findOrFail($id);
        $data = [
            'status' => 'AVAILABLE',
        ];
        $config = IfoodConfig::where('empresa_id', request()->empresa_id)->first();

        $result = $this->util->updateStatusProduct($config, $data, $item->ifood_id_aux);

        if($result['http_code'] == 200){
            $item->status = 'AVAILABLE';
            $item->save();
        }
        session()->flash("flash_success", "Produto ativado com sucesso!");
        return redirect()->back();
    }

    public function desactive($id){
        $item = ProdutoIfood::findOrFail($id);
        $data = [
            'status' => 'UNAVAILABLE',
        ];
        $config = IfoodConfig::where('empresa_id', request()->empresa_id)->first();

        $result = $this->util->updateStatusProduct($config, $data, $item->ifood_id_aux);

        if($result['http_code'] == 200){
            $item->status = 'UNAVAILABLE';
            $item->save();
        }
        session()->flash("flash_success", "Produto desativado!");
        return redirect()->back();
    }

}
