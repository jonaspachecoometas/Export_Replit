<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('etiqueta_configuracaos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->constrained('empresas');

            $table->decimal('margem_topo', 7,2);
            $table->decimal('margem_lateral', 7,2);
            $table->decimal('distancia_entre_etiquetas', 7,2);
            $table->decimal('distancia_entre_linhas', 7,2);
            $table->decimal('largura_imagem', 7,2);
            $table->decimal('altura_imagem', 7,2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etiqueta_configuracaos');
    }
};
