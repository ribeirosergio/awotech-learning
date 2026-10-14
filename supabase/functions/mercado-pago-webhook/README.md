# Webhook Mercado Pago — ainda não implementado

Não há endpoint executável nesta etapa. A integração futura deve validar a assinatura, consultar o pagamento diretamente no provedor e conferir produto, valor, moeda, usuário e status aprovado usando configuração segura.

Registrar o pagamento e conceder acesso de forma atômica e idempotente: o mesmo pagamento não pode criar ou prorrogar acesso repetidamente. Retorno de checkout no frontend não concede acesso. Definir também o tratamento de estorno/cancelamento antes de comercializar.

Manter tokens e chave de serviço apenas em segredos server-side. A operação de kits será adicionada depois do fluxo digital.
