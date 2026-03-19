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
        Schema::create('natureza_operacao_supers', function (Blueprint $table) {
            $table->id();

            $table->string('descricao', 100);

            $table->string('cst_csosn', 3)->nullable();
            $table->string('cst_pis', 3)->nullable();
            $table->string('cst_cofins', 3)->nullable();
            $table->string('cst_ipi', 3)->nullable();

            $table->string('cfop_estadual', 4)->nullable();
            $table->string('cfop_outro_estado', 4)->nullable();
            $table->string('cfop_entrada_estadual', 4)->nullable();
            $table->string('cfop_entrada_outro_estado', 4)->nullable();

            $table->decimal('perc_icms', 5,2)->nullable();
            $table->decimal('perc_pis', 5,2)->nullable();
            $table->decimal('perc_cofins', 5,2)->nullable();
            $table->decimal('perc_ipi', 5,2)->nullable();
            $table->boolean('padrao')->default(0);
            $table->boolean('sobrescrever_cfop')->default(0);
            $table->boolean('status')->default(1);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('natureza_operacao_supers');
    }
};
